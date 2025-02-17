import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import NamespacedPage, {
  NamespacedPageVariants,
} from '@console/dev-console/src/components/NamespacedPage';
import CreateProjectListPage, {
  CreateAProjectButton,
} from '@console/dev-console/src/components/projects/CreateProjectListPage';
import { withStartGuide } from '@console/internal/components/start-guide';
import { Page, history } from '@console/internal/components/utils';
import {
  MenuAction,
  MenuActions,
  MultiTabListPage,
  useFlag,
  useUserSettings,
} from '@console/shared';
import {
  FLAG_OPENSHIFT_PIPELINE_AS_CODE,
  PREFERRED_DEV_PIPELINE_PAGE_TAB_USER_SETTING_KEY,
} from '../../const';
import { PipelineModel, RepositoryModel } from '../../models';
import { usePipelineTechPreviewBadge } from '../../utils/hooks';
import RepositoriesList from '../repository/list-page/RepositoriesList';
import PipelinesList from './list-page/PipelinesList';
import { PipelinesPage } from './PipelinesPage';

type PipelineTabbedPageProps = RouteComponentProps<{ ns: string }>;

export const PageContents: React.FC<PipelineTabbedPageProps> = (props) => {
  const { t } = useTranslation();
  const {
    match: {
      params: { ns: namespace },
    },
  } = props;
  const badge = usePipelineTechPreviewBadge(namespace);
  const isRepositoryEnabled = useFlag(FLAG_OPENSHIFT_PIPELINE_AS_CODE);
  const [preferredTab, , preferredTabLoaded] = useUserSettings<string>(
    PREFERRED_DEV_PIPELINE_PAGE_TAB_USER_SETTING_KEY,
    'pipelines',
  );

  React.useEffect(() => {
    if (preferredTabLoaded) {
      if (isRepositoryEnabled && preferredTab === 'repositories') {
        history.push(`/dev-pipelines/ns/${namespace}/repositories`);
      }
    }
  }, [isRepositoryEnabled, namespace, preferredTab, preferredTabLoaded]);

  const [showTitle, hideBadge, canCreate] = [false, true, false];
  const menuActions: MenuActions = {
    pipeline: {
      model: PipelineModel,
      onSelection: (key: string, action: MenuAction, url: string) => `${url}/builder`,
    },
    repository: {
      model: RepositoryModel,
      onSelection: (_key: string, _action: MenuAction, url: string) => `${url}/form`,
    },
  };
  const pages: Page[] = [
    {
      href: '',
      name: t(PipelineModel.labelPluralKey),
      component: PipelinesList,
    },
    {
      href: 'repositories',
      name: t(RepositoryModel.labelPluralKey),
      component: RepositoriesList,
      pageData: { showTitle, hideBadge, canCreate },
    },
  ];

  return namespace ? (
    isRepositoryEnabled ? (
      <MultiTabListPage
        pages={pages}
        match={props.match}
        title={t('pipelines-plugin~Pipelines')}
        badge={badge}
        menuActions={menuActions}
      />
    ) : (
      <PipelinesPage {...props} />
    )
  ) : (
    <CreateProjectListPage title={t('pipelines-plugin~Pipelines')}>
      {(openProjectModal) => (
        <Trans t={t} ns="pipelines-plugin">
          Select a Project to view its details
          <CreateAProjectButton openProjectModal={openProjectModal} />.
        </Trans>
      )}
    </CreateProjectListPage>
  );
};

const PageContentsWithStartGuide = withStartGuide(PageContents);

const PipelineTabbedPage: React.FC<PipelineTabbedPageProps> = (props) => {
  return (
    <NamespacedPage variant={NamespacedPageVariants.light} hideApplications>
      <PageContentsWithStartGuide {...props} />
    </NamespacedPage>
  );
};

export default PipelineTabbedPage;
